import axios from "axios";

export const useUserActions = () => {
  const handleDeleteUser = async (userId: string) => {
    try {
      console.log(userId)
      const response = await axios.delete(`/api/users/${userId}`);
      console.log(response)
      return {
        success: true,
        message: "User deleted successfully",
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message ?? "Failed to delete user";
        console.warn("Error deleting user:", errorMessage);
        return {
          success: false,
          message: errorMessage,
        }
      }
      console.error("Error deleting user:", error);
      return {
        success: false,
        message: "An error occurred while deleting the user",
      }
    }
  };

  return {
    handleDeleteUser,
  };
}