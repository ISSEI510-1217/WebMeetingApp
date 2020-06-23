defmodule MyAppWeb.UserController do
  use MyAppWeb, :controller
  require Logger
  require IEx
  alias MyApp.Accounts
  alias MyApp.Accounts.User
 plug :action

  def index(conn, _params) do
    # GitHub の認証ページへリダイレクトさせます
    redirect conn, external: Accounts.authorize_url!
  end

  def callback(conn, %{"code" => code}) do
  # 返却されたコードからトークンを取得します
    client = Accounts.get_token!(code: code)

    # アクセストークンを使ってユーザ情報取得API にリクエストします.
    user = %{
      name: client,
      age: nil,
      token: client.token.access_token
    }
    Accounts.create_user(user)
    conn
    |> put_session(:current_user, client)
    |> put_session(:access_token, client.token.access_token)
    |> redirect(to: "/home")
  end
  # def index(conn, _params) do
  #   users = Accounts.list_users()
  #   render(conn, "index.html", users: users)
  # end

  # def new(conn, _params) do
  #   changeset = Accounts.change_user(%User{})
  #   render(conn, "new.html", changeset: changeset)
  # end

  # def create(conn, %{"user" => user_params}) do
  #   case Accounts.create_user(user_params) do
  #     {:ok, user} ->
  #       conn
  #       |> put_flash(:info, "User created successfully.")
  #       |> redirect(to: Routes.user_path(conn, :show, user))

  #     {:error, %Ecto.Changeset{} = changeset} ->
  #       render(conn, "new.html", changeset: changeset)
  #   end
  # end

  # def show(conn, %{"id" => id}) do
  #   user = Accounts.get_user!(id)
  #   render(conn, "show.html", user: user)
  # end

  # def edit(conn, %{"id" => id}) do
  #   user = Accounts.get_user!(id)
  #   changeset = Accounts.change_user(user)
  #   render(conn, "edit.html", user: user, changeset: changeset)
  # end

  # def update(conn, %{"id" => id, "user" => user_params}) do
  #   user = Accounts.get_user!(id)

  #   case Accounts.update_user(user, user_params) do
  #     {:ok, user} ->
  #       conn
  #       |> put_flash(:info, "User updated successfully.")
  #       |> redirect(to: Routes.user_path(conn, :show, user))

  #     {:error, %Ecto.Changeset{} = changeset} ->
  #       render(conn, "edit.html", user: user, changeset: changeset)
  #   end
  # end

  # def delete(conn, %{"id" => id}) do
  #   user = Accounts.get_user!(id)
  #   {:ok, _user} = Accounts.delete_user(user)

  #   conn
  #   |> put_flash(:info, "User deleted successfully.")
  #   |> redirect(to: Routes.user_path(conn, :index))
  # end
end
