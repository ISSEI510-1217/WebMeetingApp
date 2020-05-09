#認証情報を扱えるパイプライン

defmodule MyApp.Auth.LoginSessionPipeline do
  use Guardian.Plug.Pipeline, otp_app: :my_app
  plug Guardian.Plug.VerifySession, claims: %{"typ" => "access"}
  plug Guardian.Plug.LoadResource, allow_blank: true
end
