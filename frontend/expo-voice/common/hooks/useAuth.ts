import { useUtilities } from "./useUtilities";

interface UseAuthProps {
    // maybe his phone number?
}

export const useAuth = ({ }: UseAuthProps) => {
    const { useAppSelector } = useUtilities();
    const token = useAppSelector((state) => state.auth.token);
    const isLoadingUser = useAppSelector((state) => state.auth.isLoadingUser);
    const user = useAppSelector((state) => state.auth.user);
    const error = useAppSelector((state) => state.auth.error);


    return { isLoadingUser, user,error, token };
}

