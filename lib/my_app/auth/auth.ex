defmodule MyApp.Auth do
  alias MyApp.{Repo, users}
  alias MyApp.Auth.Guardian

  # 入力されたメールアドレスでusersを探して、パスワードで認証する
  def authenticate_users(email, password) do
    Repo.get_by(users, email: email)
    |> check_password(password)
  end

  # usersでログイン状態にする
  def login(conn, users) do
    conn
    |> Guardian.Plug.sign_in(users)
    |> Guardian.Plug.remember_me(users) # ブラウザを閉じてもクッキーからセッションを復元する
    |> Plug.Conn.assign(:current_users, users)
  end

  # ログアウトする
  def logout(conn) do
    conn
    |> Guardian.Plug.sign_out()
  end

  # 現在ログイン中のusersを返す
  def load_current_users(conn, _) do
    conn
    |> Plug.Conn.assign(:current_users, Guardian.Plug.current_resource(conn))
  end

  defp check_password(nil, _) do
    {:error, "メールアドレスが違います"}
  end

  defp check_password(users, password) do
    case Comeonin.Argon2.checkpw(password, users.password_hash) do
      true -> {:ok, users}
      false -> {:error, "パスワードが違います"}
    end
  end
end
