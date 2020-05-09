#EnsureAuthPipeline用のエラー時の挙動を定義するErrorHandle module

defmodule MyApp.Auth.EnsureAuthErrorHandler do
  import Phoenix.Controller, only: [put_flash: 3, redirect: 2]
  import MyAppWeb.Router.Helpers, only: [users_login_path: 2]

  def auth_error(conn, {type, _reason}, _opts) do
    # ログインしていなかった場合はログイン画面にリダイレクトさせる
    conn
    |> put_flash(:error, to_string(type))
    |> redirect(to: users_login_path(conn, :new))
  end
end
