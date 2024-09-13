import ProfileScreen from "../screens/ProfileScreen";
import { UserAuth } from "../context/AuthContext";
import SEO from "../components/SEO";

function Profile() {
  const { uf, uid } = UserAuth();
  const { displayName } = uf;

  return (
    <div className="px-[15px]">
      <ProfileScreen data={uf} uid={uid} />
      <SEO
        url={window.location.href}
        title={`Quản lí hồ sơ - ${displayName}`}
        description="Tại đây bạn có thể chỉnh sửa hoặc xem xét lại thông tin tài khoản của mình"
      />
    </div>
  );
}

export default Profile;
