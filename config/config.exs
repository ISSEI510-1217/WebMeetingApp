# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :my_app,
  ecto_repos: [MyApp.Repo]

# Configures the endpoint
config :my_app, MyAppWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "qzK7rxNUhtD+4Eu9wtA1iHE0Q1MDoTa6czNiZm2+pIHqrvBk1naBo/qzYgBV1dar",
  render_errors: [view: MyAppWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: MyApp.PubSub,
  live_view: [signing_salt: "j8GE5NFY"]

#Piepeline, Guardian, ErrorHandlerの関連付け
config :my_app, MyApp.Auth.LoginSessionPipeline,
  module: MyApp.Auth.Guardian

config :my_app, MyApp.Auth.EnsureAuthPipeline,
  module: MyApp.Auth.Guardian,
  error_handler: MyApp.Auth.EnsureAuthErrorHandler

config :my_app, MyApp.Auth.EnsureNotAuthPipeline,
  module: MyApp.Auth.Guardian,
  error_handler: MyApp.Auth.EnsureNotAuthErrorHandler


# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
