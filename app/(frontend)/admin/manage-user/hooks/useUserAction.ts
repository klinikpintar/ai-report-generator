export const useUserActions = () => {
  const handleDeleteUser = (userId: string) => {
    // TODO: implement DELETE /api/users/{id}
    console.log(userId)
    // await axios.delete(`/api/users/${user.id}`);
    return true
  }
  return {
    handleDeleteUser,
  };
};
