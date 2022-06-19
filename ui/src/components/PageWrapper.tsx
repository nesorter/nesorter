import { Link } from "react-router-dom";
import { Box } from "./Box";
import { Text } from "./Text";

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      padding="lg"
      gap="lg"
      backgroundColor="dark100"
      flexDirection="column"
      height="100%"
      maxHeight="100vh"
    >
      <Box gap="lg">
        {[
          { to: '/', title: 'Status' },
          { to: '/classify', title: 'Classify' },
          { to: '/playlists', title: 'Playlists' }
        ].map((item) => (
          <Link key={item.to} to={item.to}>
            <Text color="textLight">{item.title}</Text>
          </Link>
        ))}
      </Box>

      <Box>
        {children}
      </Box>
    </Box>
  );
}
