/**
 * Function to get the pagination meta data
 * @param page
 * @param limit
 * @returns
 */
export const getPaginationMeta = (page: number, limit: number = 20) => {
  const from = page ? (page - 1) * limit : 0;
  const to = page ? from + limit - 1 : limit - 1;

  return { from, to };
};
