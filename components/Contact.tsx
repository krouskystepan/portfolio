import ContactForm from './form/ContactForm'

export default function Contact() {
  return (
    <section
      id="contact"
      className="w-full max-w-4xl scroll-mt-[5rem] px-4 py-[7.5rem] sm:scroll-mt-[10rem]"
    >
      <div className="mx-auto text-center">
        <h3 className="section-heading">Contact me</h3>
        <p className="text-gray-700">
          Please contact me directly at{' '}
          <a
            className="text-gradient cursor-pointer font-semibold"
            href="mailto:stepan.krousky@seznam.cz"
          >
            stepan.krousky@seznam.cz
          </a>{' '}
          or through this form.
        </p>
        <ContactForm />
      </div>
    </section>
  )
}
