#ログインしていることを保証するパイプライン

defmodule MyApp.Auth.EnsureAuthPipeline do
  use Guardian.Plug.Pipeline, otp_app: :my_app
  plug Guardian.Plug.EnsureAuthenticated
end
