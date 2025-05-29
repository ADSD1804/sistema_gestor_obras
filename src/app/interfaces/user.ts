export interface User {
    id: number;
    name: string;
    email: string;
    role: 'arquitecto' | 'supervisor' | 'trabajador';
    image: string;
    zone?: string;
    createdAt?: string;
}
