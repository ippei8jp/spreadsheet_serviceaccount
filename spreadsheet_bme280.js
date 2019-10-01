// モジュール読み込み
const BME280 = require('bme280-sensor');
const GoogleSpreadsheet = require("google-spreadsheet");
const dateFormat = require('dateformat');                               // 日付の整形用

// 個別設定
const settings = {
    spreadsheetID: "1InoMVOLEL_OuNgsfDBmc_5G3N3tsvZi9VCrYa4WMYbw",      // ここはスプレッドシートごとに書き換える必要がある
    jsonFilePath: "./MyProject1-creds.json"                             // ここは認証情報ごとに書き換える必要がある   requireで読むので"./"が必須。
};

// ターゲットシートの情報
const target_sheet_info = {
    title: 'BME280',
    headers: ['date', 'temperature_C', 'humidity', 'pressure_hPa']
};

// 認証情報をロード
const creds = require(settings.jsonFilePath);

// インスタンスの生成
const spreadsheet = new GoogleSpreadsheet(settings.spreadsheetID);

// データ読み出し間隔(msec)
const intervalBme280 = 5000;

// BME280のインスタンス生成
const bme280 = new BME280({i2cBusNo : 1, i2cAddress : 0x76});

async function awaitDelay(timeMS) {
    return new Promise((resolve, reject) => {
        setTimeout(()=> {
            resolve();
        }, timeMS)
    })
}


// BME280 データ読み出し(周期呼び出し)
async function readBme280() {
    try {
        let data = await bme280.readSensorData();
        return data;
    } catch(err) {
        console.log(`BME280 read error: ${err}`);
        throw err;
    }
};

// 認証処理
async function setAuth(doc) {
    return new Promise((resolve, reject)=>{
        // console.log("setAuth_1");
        doc.useServiceAccountAuth(creds, (err) => {
            // console.log("setAuth_2");
            if (err)    reject(err);
            else        resolve();
        });
    });
}

// ワークシートの情報取得
async function getTargetWorksheet(doc, sheet_info) {
    return new Promise((resolve, reject) => {
        // console.log("getTargetWorksheet_1");
        let target_sheet;
        doc.getInfo((err, info) => {
            // console.log("getTargetWorksheet_2");
            // エラー発生したらreject
            if (err)    reject(err);

            // 取得データの確認
            // console.log(JSON.stringify(info, null , "    "));

            // ワークシート配列内に指定したタイトルのシートが存在するかどうかを検索
            let ret = info.worksheets.some((item) => {
                if (item.title === sheet_info.title) {
                    target_sheet = item;
                    return true;
                }
                else {
                    return false;
                }
            });

            if (!ret) {
                // 存在しない
                console.log("新しいシートを作成します");
                doc.addWorksheet(sheet_info, (err, sheet) => {
                   // console.log("getTargetWorksheet_3");
                     // エラー発生したらreject
                    if (err) reject(err);

                    target_sheet = sheet;
                    resolve(target_sheet);
                })
            }
            else {
                // 存在する
                // console.log("シートは存在します");
                // target_sheet は↑で設定済み
                resolve(target_sheet);
            }
        });
    });
}

//  1行データを追加
async function AddRowData(sheet, row_data) {
    return new Promise((resolve, reject)=>{
        // console.log("AddRowData_1");
        sheet.addRow(row_data, (err) => {
            // console.log("AddRowData_2");
            if (err) reject(err);
            else resolve();
        });
    });
}

async function spreadsheetAddRowDatta(row_data) {
    try {
        // 認証処理
        await setAuth(spreadsheet);
        console.log('setAuth Done.');

        // ターゲットシートのインスタンスを取得
        let sheet = await getTargetWorksheet(spreadsheet, target_sheet_info);
        console.log('getTargetWorksheet Done.');

        await AddRowData(sheet, row_data);
        console.log('AddRowData Done.');
    } catch(err) {
        // 失敗
        console.log('Error: ' + err);
    }
}

async function main() {
    try {
        // BME280 初期化
        await bme280.init();
        console.log('BME280 initialization succeeded');
    } catch(err) {
        // 失敗
        console.error(`BME280 initialization failed: ${err} `);
        throw err;
    }

    try {
        for (ii = 0; ii < 24; ii++) {
            console.log("loop = ", ii);

            // センサデータ読み出し 
            data = await readBme280();
            data.date = dateFormat(new Date(), 'yyyy/mm/dd HH:MM:ss');          // 日付を追加

            // for DEBUG
            console.log(JSON.stringify(data, null , "  "));

            // spreadsheetに書き込み
            spreadsheetAddRowDatta(data);

            // 時間待ち
            await awaitDelay(intervalBme280);
        }
    } catch(err) {
        // 失敗
        throw err;
    }
}

main();
