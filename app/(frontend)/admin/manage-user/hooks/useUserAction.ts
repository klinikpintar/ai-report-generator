import axios from "axios";

export const useUserActions = () => {
  const handleDeleteUser = async (userId: string) => {
    console.log(userId)
    await axios.delete(`/api/users/${userId}`);
    return true
  }
  return {
    handleDeleteUser,
  };
};
