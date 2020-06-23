defmodule MyAppWeb.PageController do
  use MyAppWeb, :controller

  def index(conn, _params) do
    if get_session(conn, :current_user) do
      conn
      |> redirect(to: "/home")
    end
    render(conn, "index.html")
  end
end
