#Guardian moduleの用意
#subject_for_token -> ユーザを識別できる情報を返す
#resource_from_claims -> subject_for_tokenの情報がclaims[“sub”]で参照できるので, そこからユーザを取得

defmodule MyApp.Auth.Guardian do
  use Guardian, otp_app: :my_app
  alias MyApp.{Repo, users}
  def subject_for_token(resource, _claims) do
    sub = to_string(resource.id)
    {:ok, sub}
  end

  def resource_from_claims(claims) do
    id = claims["sub"]
    users = Repo.get(users, id)
    {:ok, users}
  end
end
