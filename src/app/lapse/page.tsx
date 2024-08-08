import TimeLapseComponent from "../components/TimeLapseComponent";

// 日本時間の日付を取得する関数
const getJSTDate = (date: Date) => {
    const offset = 9 * 60; // JST は UTC+9
    const localDate = new Date(date.getTime() + offset * 60 * 1000);
    return localDate.toISOString().split('T')[0];
};

interface TimeLapseProps {
    date?: string; // date はオプショナルにする
}

export default function TimeLapse({ date }: TimeLapseProps) {
    // 今日の日付を yyyy-mm-dd 形式で取得
    const today = new Date();
    const defaultDate = getJSTDate(today);

    // date が undefined であればデフォルトの日付を使用
    const displayDate = date || defaultDate;

    return (
        <TimeLapseComponent date={displayDate} />
    );
}
