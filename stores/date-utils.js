export const nowDateStr = () => {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需要加1
	const day = String(today.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

export const isToday = (dateString) => {
	const today = new Date();
	const date = new Date(dateString);

	return (
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()
	);
}