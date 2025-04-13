

import GradientBlurCircles from "../../components/Gradient";
import CurateForm from "./CurateForm";


// const getAccounts = async () => {
//     try {
//         const accounts = await db.collection("accounts").get();
//         console.log(accounts);
//         return [];
//     } catch (error) {
//         console.error("Error fetching accounts: ", error);
//         return [];
//     }
// };

const Curate = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <GradientBlurCircles />
            <CurateForm />
        </div>
    )
}

export default Curate