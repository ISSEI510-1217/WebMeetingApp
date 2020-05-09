#ログインしていないことを保証するパイプライン

defmodule MyApp.Auth.EnsureNotAuthPipeline do
  use Guardian.Plug.Pipeline, otp_app: :my_app
  plug Guardian.Plug.EnsureNotAuthenticated
end
