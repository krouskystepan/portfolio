import { useFormStatus } from 'react-dom'

export default function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      aria-label="Submit Form Button"
      className="group flex h-[2.5rem] w-[6rem] items-center justify-center self-end rounded-xl bg-gradient-to-bl from-[#228CDB] to-[#2b63b2] text-[#F9F9F9] outline-2 outline-[#F9F9F9] hover:border-2 hover:border-[#228CDB] hover:from-[#F9F9F9] hover:to-[#F9F9F9] hover:text-[#228CDB] focus:bg-[#F9F9F9] focus:from-[#F9F9F9] focus:to-[#F9F9F9] focus:text-[#228CDB] focus:outline-2 focus:outline-[#228CDB]"
      disabled={pending}
    >
      {pending ? (
        <div className="size-6 animate-spin rounded-full border-b-2 border-[#F9F9F9] group-hover:border-[#228CDB]" />
      ) : (
        <>Submit</>
      )}
    </button>
  )
}
