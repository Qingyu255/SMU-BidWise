import createClient  from '@/utils/supabase/server';

const supabase = createClient();

export const getLatestTerm = async () => {
  const { data: latestTerm, error: latestTermError } = await supabase
    .rpc('get_latest_term') // call the custom rpc supabase sql function
    .single();

  if (latestTermError) {
    console.error('Error fetching latest term:', latestTermError.message);
    return null;
  }
  return latestTerm;
}

export async function getCareers() {
  try {
    const { data, error }: any = await supabase.rpc('get_careers_ordered_by_frequency');

    if (error) {
      console.error("Error fetching careers:", error);
      return [];
    }

    const careers = data.map((item: { career: string }) => item.career);
    return careers;

  } catch (err) {
    console.error("Error in getCareers function:", err);
    return [];
  }
}

export async function getGradingBasisTypes() {
  try {
    const { data, error }: any = await supabase.rpc('get_grading_basis_ordered_by_frequency');

    if (error) {
      console.error("Error fetching grading_basis:", error);
      return [];
    }

    const gradingBasisTypes = data.map((item: { grading_basis: string }) => item.grading_basis);
    return gradingBasisTypes;

  } catch (err) {
    console.error("Error in getGradingBasisTypes function:", err);
    return [];
  }
}
