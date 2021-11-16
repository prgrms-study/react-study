const parseDate = rawDate => {
  const year = rawDate.getFullYear();
  const month = ('0' + (rawDate.getMonth() + 1)).slice(-2);
  const date = ('0' + rawDate.getDate()).slice(-2);

  const week = ['일', '월', '화', '수', '목', '금', '토'];
  const day = week[rawDate.getDay()];

  return {
    year,
    month,
    date,
    day,
  };
};

export { parseDate };
