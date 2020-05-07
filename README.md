# MyApp

## First setup with Docker

```
docker-compose up --build -d
docker-compose run web bash -c "mix deps.compile && mix ecto.create && mix ecto.migrate"
```

- その後,`localhost:4000`にアクセスできるか確認する.

## mix popular command

使いそうなものを下記に列挙

`mix deps`

- 依存関係を確認するコマンド

`mix deps.get`

- 依存関係を解消するコマンド

`mix deps.compile`

- 依存するライブラリを全てコンパイルする

`mix ecto.create`

- db の作成.

`mix ecto.migrate`

- migration を行う.

`mix phx.new project_name`

- phoenix プロジェクトを新規で作成するコマンド

`mix phx.gen.html Context名 スキーマ名 リソース名 スキーマのリスト（項目名:型）`

- Web レイヤーの実装（コントローラ、ビュー、テンプレート）や,Ecto のマイグレーションファイルや Context を生成してくれる.

`mix phx.gen.context`

- Context の生成.(意味はここでは記述しない.)
- 使用方法は上の `mix phx.gen.html`と同じ

`mix phx.gen.channel channel_name`

- Channel を生成するためのコマンド.Channel とはリアルタイム WEB 用に用いる Websocket 等のインターフェイス.つまりリアルタイム通信で必要っぽい.

`mix phx.server`

- phoenix サーバーを立ち上げるコマンド

`mix phx.digest`

- 静的ファイルを圧縮する.
- パスが指定されていない場合は `priv/static` を使用する.
- ほぼ,デプロイの時に使用される.
