#EnsureNotAuthPipeline用のエラー時の挙動を定義するErrorHandle module

defmodule MyApp.Auth.EnsureNotAuthErrorHandler do
  import Phoenix.Controller, only: [put_flash: 3, redirect: 2]
  import MyAppWeb.Router.Helpers, only: [users_root_path: 2]

  def auth_error(conn, {type, _reason}, _opts) do
    # ログインしていた場合は管理画面トップにリダイレクトさせる
    conn
    |> put_flash(:error, to_string(type))
    |> redirect(to: users_root_path(conn, :new))
  end
end
