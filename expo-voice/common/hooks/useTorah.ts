interface useTorahProps {
    token: string | null;
    parasha: string;
    aliyah: string;
    clean:boolean;
}

export const useTorah = ({ token, parasha, aliyah, clean }: useTorahProps) => {
    //fetch data from api
    
