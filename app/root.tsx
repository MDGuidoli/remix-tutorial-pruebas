import "@mantine/core/styles.css"
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
    Form,
    Link,
    Links,
    Meta,
    NavLink,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useNavigation,
    useSubmit,
} from "@remix-run/react";
import React, { useEffect } from "react";
import { 
    AppShell, 
    ColorSchemeScript, 
    MantineProvider, 
    Group, 
    TextInput, 
    Button, 
     } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { createEmptyContact, getContacts } from "./data";
import appStylesHref from "./app.css?url";

export const action = async () => {
  const contact = await createEmptyContact();
  return json({ contact });
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

export default function App({ children }: { children: React.ReactNode}) {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      "q"
    );
  const [opened, { toggle }] = useDisclosure();

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider>
          <AppShell navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened }}} padding="md">
            <AppShell.Navbar p="md">
              <Group>
                <Form
                  id="search-form"
                  onChange={(event) => {
                    const isFirstSearch = q === null;
                    submit(event.currentTarget, {
                      replace: !isFirstSearch,
                    });
                  }}
                  role="search"
                >
                  <TextInput
                    className={searching ? "loading" : ""}
                    defaultValue={q || ""}
                    id="q"
                    name="q"
                    placeholder="Search"
                    type="search" 
                  />
                </Form>
                <Form>
                  <Button variant="outline" type="submit">New</Button>
                </Form>
              </Group>
              <nav>
                {contacts.length ? (
                  <ul>
                    {contacts.map((contact) => (
                      <li key={contact.id}>
                        <NavLink
                          className={({ isActive, isPending }) =>
                          isActive
                            ? "active"
                            : isPending
                            ? "pending"
                            : ""
                          }
                          to={`contacts/${contact.id}`} 
                        >
                          <Link to={`contacts/${contact.id}`}>
                            {contact.first || contact.last ? (
                              <>
                                {contact.first} {contact.last}
                              </>
                            ) : (
                              <i>No Name</i>
                            )}{" "}
                            {contact.favorite ? (
                              <span>★</span>
                            ) : null}
                          </Link>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    <i>No contacts</i>
                  </p>
                )}
              </nav>
            </AppShell.Navbar>
            <AppShell.Main>
              Main
            </AppShell.Main>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}