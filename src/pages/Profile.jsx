import ProfileScreen from "../screens/ProfileScreen";
import { UserAuth } from "../context/AuthContext";

function Profile() {
  const { lg, uf, uid } = UserAuth();

  return (
    <div className="px-[15px]">
      <ProfileScreen data={uf} uid={uid} />
    </div>
  );
}

export default Profile;
