import { Box, Grid, GridItem, Stack, Wrap } from "@chakra-ui/react";
import SideBar from "../../components/sidebar/SideBar";
import { useParams } from "react-router-dom";
import axios from "axios";
import MedicineCard from "../../components/medicinecard/MedicineCard";
import { useQuery } from "@tanstack/react-query";

const getToken = (): string | null => {
  return localStorage.getItem("token");
};
function MedicineWarehousePage() {
  const { distributor_id } = useParams();
  localStorage.setItem("DistributorID", JSON.stringify(distributor_id)); // Extract distributorId from URL

  const fetchMedicines = async () => {
    const token = getToken();
    const response = await axios.get(
      "http://172.201.204.133:3000/stock/pharmacy/distributor",
      {
        params: { distributor_id: distributor_id },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("response brou", response.data.data.result.medicine_quantity); // Log the entire response

    // if (!response.data.result || !response.data.result.medicine_quantity) {
    //   throw new Error("Invalid response structure");
    // }

    const result = response.data.data.result.medicine_quantity;
    const updatedResult = await Promise.all(
      result.map(async (medicine: any) => {
        console.log("quantity", medicine.quantity);
        const imagePath = medicine.medicine.imageUrl;
        const imageResponse = await axios.get(imagePath, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        medicine.medicine["imageUrl"] = imageResponse.config.url;
        return medicine;
      })
    );

    return updatedResult;
  };

  const { isLoading, isError, data, error } = useQuery<any[]>({
    queryKey: ["medicines", distributor_id], // Add distributorId to query key for caching
    queryFn: fetchMedicines,
  });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (isError) {
    return <span>Error brou: {error.message}</span>;
  }

  return (
    <Grid
      templateAreas={`
    "nav main"
    `}
      gridTemplateColumns={"250px 1fr"}
      h="100vh"
      w="100vw" // Full height of the viewport
      overflowX="auto"
    >
      {/* Sidebar */}
      <GridItem area={"nav"}>
        <SideBar children={undefined} />
      </GridItem>
      {/* Main Content Area */}
      <GridItem area={"main"}>
        <Box w="100%" h="100%" mt="8">
          <Stack p={0} justifyContent="center" alignItems="center">
            <Wrap spacing={4}>
              {data?.map((med, index) => (
                <MedicineCard
                  footer={true}
                  key={index}
                  name={med.medicine.name}
                  imageUrl={med.medicine.imageUrl}
                  description={med.medicine.description}
                  price={med.medicine.price}
                  reference={med.medicine.reference}
                  _id={med.medicine._id}
                  __v={med.medicine.__v}
                />
              ))}
            </Wrap>
          </Stack>
        </Box>
      </GridItem>
    </Grid>
  );
}

export default MedicineWarehousePage;
