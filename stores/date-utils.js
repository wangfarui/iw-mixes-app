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


// 获取指定日期的第一天和最后一天(字符串yyyy-MM-dd)。 date 要是new Date对象
export const getMonthStartAndEnd = (date) => {
  // 获取该月的第一天
  const firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  
  // 获取该月的最后一天
  const lastDay = new Date(date.getFullYear(), date.getMonth(), 0);
  
  return {
    firstDay: formatDate(firstDay), // 转为 YYYY-MM-DD 格式
    lastDay: formatDate(lastDay),
  };
}

export const formatDate = (date) => {
	return `${date.getFullYear()}-${(date.getMonth() + 1)
  .toString()
  .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
}