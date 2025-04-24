import { User } from "../types/user";

export const useUserActions = () => {
  const handleDeleteUser = (user: User) => {
    // WIP
    console.log(user.name)
    return true
  }
  return {
    handleDeleteUser,
  };
};
