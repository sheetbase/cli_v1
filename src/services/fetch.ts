import axios from 'axios';

export async function getData(input: string) {
  const { data } = await axios({ method: 'GET', url: input });
  return data;
}