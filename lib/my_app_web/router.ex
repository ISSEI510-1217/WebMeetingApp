defmodule MyAppWeb.Router do
  use MyAppWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :login_session do
    plug MyApp.Auth.LoginSessionPipeline
  end

  pipeline :ensure_auth do
    plug MyApp.Auth.EnsureAuthPipeline
  end

  pipeline :ensure_not_auth do
    plug MyApp.Auth.EnsureNotAuthPipeline
  end

  scope "/users", MyAppWeb.users, as: :users do
    # ログインしている場合のみ表示できるページなので :ensure_auth を含む
    pipe_through [:browser, :login_session, :ensure_auth]
    get "/", ArticleController, :index, as: :root
    delete "/logout", SessionController, :delete, as: :logout
  end

  scope "/users", MyAppWeb.users, as: :users do
    # ログインしていない場合のみ表示できるページなので :ensure_not_auth を含む
    pipe_through [:browser, :login_session, :ensure_not_auth]
    get "/login", SessionController, :new, as: :login
    post "/login", SessionController, :create, as: :login
  end

  scope "/", MyAppWeb do
    pipe_through [:browser, :login_session]

    get "/", PageController, :index

    #ここ微妙(注意)
    resources "/", ArticleController, only: [:index]
    resources "/users", UserController
  end

  # Other scopes may use custom stacks.
  # scope "/api", MyAppWeb do
  #   pipe_through :api
  # end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through :browser
      live_dashboard "/dashboard", metrics: MyAppWeb.Telemetry
    end
  end
end
