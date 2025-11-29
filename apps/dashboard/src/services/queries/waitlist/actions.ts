import axios from "axios";

const fileUploadApi = axios.create({
  baseURL: "https://fomoed-data-ingestion-509111531565.us-central1.run.app/api/v1",
});

export const uploadProfileImage = async (file: File, headers?: Record<string, string>) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fileUploadApi.post("/profile/image-update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...headers,
    },
  });

  return res.data; // axios auto-parses JSON
};
