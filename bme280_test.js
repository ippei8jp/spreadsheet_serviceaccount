const BME280 = require('bme280-sensor');
const dateFormat = require('dateformat');                               // 日付の整形用

// データ読み出し間隔(msec)
const intervalBme280 = 5000;

// BME280のインスタンス生成
const bme280 = new BME280({i2cBusNo : 1, i2cAddress : 0x76});


// 数値表示用桁合わせ処理
// integer_len: 整数部長さ
// decimal_len: 小数部長さ
const DecimalAlignment = (val, integer_len, decimal_len=0) => {
    let len = integer_len;
    if (decimal_len > 0) {
        len += decimal_len + 1;     // 小数部長さと小数点の分を加算
    }
    return (Array(len).join(' ') + val.toFixed(decimal_len)).slice(-len);
}


// BME280 データ読み出し(周期呼び出し)
async function readBme280() {
    try {
        let data = await bme280.readSensorData();
        data.date = dateFormat(new Date(), "yyyy/mm/dd HH:MM:ss"),
        // console.log(JSON.stringify(data, null , "  "));
        // console.log(`${data.date}    温度: ${data.temperature_C}deg_C    湿度: ${data.humidity}%    気圧:${data.pressure_hPa}hPa`);
        data_disp = {
            date:          data.date,
            temperature_C: DecimalAlignment(data.temperature_C, 3, 2),
            humidity:      DecimalAlignment(data.humidity, 3, 2),
            pressure_hPa:  DecimalAlignment(data.pressure_hPa, 4, 2)
        };
        console.log(`${data_disp.date}    温度: ${data_disp.temperature_C}deg_C    湿度: ${data_disp.humidity}%    気圧:${data_disp.pressure_hPa}hPa`);
    } catch(err) {
        console.log(`BME280 read error: ${err}`);
    }
};

// main
async function main() {
    try {
        // BME280 初期化
        await bme280.init();
        console.log('BME280 initialization succeeded');

        // センサデータ読み出し 周期処理登録
        setInterval(readBme280, intervalBme280);

        // センサデータ読み出し 最初の1回だけすぐ実行
        await readBme280();
    } catch(err) {
        // 初期化失敗
        console.error(`BME280 initialization failed: ${err} `);
    }
}

main();
