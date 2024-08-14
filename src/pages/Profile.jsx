import ProfileScreen from "../screens/ProfileScreen";
import { UserAuth } from "../context/AuthContext";

function Profile() {
  const { lg, uf } = UserAuth();

  return (
    <div className="px-[15px]">
      <ProfileScreen data={uf} />
    </div>
  );
}

export default Profile;
