export default async function Page({ params }: { params: { course_code: string } }) {
    return (
        <>
            <div>Course Code: {params.course_code.toUpperCase()}</div>
            <span>This page should conatin other info like maybe a time table depiction of available sections, section details, availabiltiy etc</span>
        </>
    )
  }