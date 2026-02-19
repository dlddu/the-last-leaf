import Link from 'next/link';

interface AuthLinkProps {
  text: string;
  linkText: string;
  href: string;
}

export default function AuthLink({ text, linkText, href }: AuthLinkProps) {
  return (
    <div className="flex items-center justify-center gap-1 text-sm">
      <span className="text-gray-600 dark:text-gray-400">{text}</span>
      <Link href={href} className="text-indigo-600 font-medium hover:underline">
        {linkText}
      </Link>
    </div>
  );
}
