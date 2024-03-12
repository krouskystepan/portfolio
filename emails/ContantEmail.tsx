import {
  Html,
  Body,
  Head,
  Heading,
  Hr,
  Container,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { Tailwind } from '@react-email/tailwind'

type ContactFormEmailProps = {
  message: string
  senderEmail: string
}

export default function ContactFormEmail({
  message,
  senderEmail,
}: ContactFormEmailProps) {
  return (
    <Html>
      <Preview>New message from your portfolio</Preview>
      <Tailwind>
        <Head />
        <Body className={`bg-gray-100 font-sans text-black`}>
          <Container>
            <Section className="my-10 rounded-lg border border-black bg-white px-10 py-4">
              <Heading className="text-center text-lg leading-tight sm:text-3xl">
                You received the following message from the contact form
              </Heading>
              <Hr />
              <Text className="bg-white text-xl text-black sm:text-lg">
                {message}
              </Text>
              <Text className="mt-5 text-base">
                The sender&apos;s email is: {senderEmail}
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
