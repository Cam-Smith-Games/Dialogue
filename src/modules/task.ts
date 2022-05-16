export interface Task {
    title: string;
    func?: () => void;
    instant?: boolean;
    delay?: number;
}