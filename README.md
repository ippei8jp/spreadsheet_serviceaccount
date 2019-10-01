
# 概要

BME280のデータをGoogleSpreadsheetへGoogle Drive APIを使用して記録するプログラムのサンプル

# 実行環境

RasbberryPi(ZERO Wで動作確認した)のI2CにBME280が接続されているものとする。  
Node.js は v10.16.3 で動作確認。  

Googleアカウントは取得済みとする。  

# Googleの準備

- [Google Developers Console](https://console.developers.google.com/project) でプロジェクトを作成
- Google Drive APIを有効化
- 認証情報(サービスアカウント キー)を作成
- 保存された認証情報の秘密鍵をカレントディレクトリにコピー  
    (ソースではファイル名を「MyProject1-creds.json」にしてある)   
    このファイルはセキュリティ上 **超重要** なので、まちがって公開しないように！！！！  
    ・・・・公開して後悔...なんちゃって(^^ゞ


- [Google Drive](https://drive.google.com/drive/u/0/my-drive)から記録するスプレッドシートを作成する(マイドライブからgoogleスプレッドシートを選択すると新規ファイルが作成される)
- 作成されたスプレッドシートに共有ユーザ(サービスアカウントキーのメールアドレス)を追加。権限を編集者、通知のチェックははずしてOKする

[手順はこちらを参考にしてくだされ。](https://techblog.lclco.com/entry/2018/11/30/120000) (コードの実装の手前まで)

# ソースの修正

- 変数 ``settings`` を 作成したスプレッドシート、認証情報のJSONファイルに合わせて修正
- 測定間隔を変更したい場合は、変数``ntervalBme280``を変更。単位はmsec。現状は5秒間隔

# モジュールのインストール

- ``npm install`` で必要なモジュールがインストールされる

bme280-sensor モジュールはNode.js v8以降だとインストール時にエラーになるので、このpackage.jsonでパッチをあてるように設定してある。  
ついでに、Node.js v10 で実行時に出るワーニング対策も入れてある。  

# プログラムの実行

以下のコマンドを実行すると、BME280で温度/湿度/気圧を測定し、spreadsheetに記録していく。  
テスト用途なので、5秒間隔で24回記録したら終了としてある。  

```
node spreadsheet_bme280.js
```

# テストプログラム

- ``bme280_test.js``  BME280のセンサデータを読み出す部分のテストプログラム。async/awaitで今風に。。。
- ``row_add_test.js`` spreadsheetに1行データを追加する部分のテストプログラム。


# ヒトコト

spreadsheetの操作サンプルソースにはasyncモジュールを使ったものが多いが、今風のasync/awaitを使うようにしてみた。  
(asyncモジュールとasync/awaitは全く別の機能。ややこしいけど。。。)    
