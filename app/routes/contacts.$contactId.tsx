import { json } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import type { FunctionComponent } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { Card, Image, Text, Group, Button, Avatar } from "@mantine/core"

import invariant from "tiny-invariant";

import type { ContactRecord } from "../data";
import { getContact, updateContact } from "../data";

export const action = async ({
    params,
    request,
}: ActionFunctionArgs) => {
    invariant(params.contactId, "Missing contactId param");
    const formData = await request.formData();
    return updateContact(params.contactId, {
      favorite: formData.get("favorite") === "true",
    });
};

export const loader = async ({ 
        params,
    }: LoaderFunctionArgs) => {
        invariant(params.contactId, "Missing contactId param");
        const contact = await getContact(params.contactId);
        if (!contact) {
            throw new Response("Not Found", { status: 404 });
        }
        return json({ contact });
};

export default function Contact() {
  const { contact } = useLoaderData<typeof loader>(); 

  return (
    <Card>
	    <Group>
		    <Avatar 
			    src={contact.avatar}
			    alt={`${contact.first} ${contact.last} avatar`}
			    size="xl"
		    />
		
		    <Group>
			    <Text>
				    {contact.first || contact.last ? (
					    <>
						    {contact.first} {contact.last}
					    </>
				    ) : (
					    <i>No Name</i>
				    )}{" "}
				    <Favorite contact={contact} />
			    </Text>
		    </Group>
		
		    {contact.twitter && (
			    <Text size="sm">
				    <a
					    href={`https://twitter.com/${contact.twitter}`}
					    target="_blank"
					    rel="noopener noreferrer"
				    >
					    {contact.twitter}
				    </a>
			    </Text>
		    )}
		
		    {contact.notes && <Text size="sm">{contact.notes}</Text>}
		
		    <Group>
			    <Form action="edit">
				    <Button justify="center" variant="filled" color="blue" size="md">
					    Edit
				    </Button>
			    </Form>
			
			    <Form
				    action="destroy"
				    method="post"
				    onSubmit={(event) => {
					    const response = confirm(
						    "Please confirm you want to delete this record."
					    );
					    if (!response) {
						    event.preventDefault();
					    }
				    }}
			    >
				    <Button justify="center" variant="filled" color="red" size="md">
					    Delete
				    </Button>
			    </Form>
		    </Group>
	    </Group>
    </Card>
  );
}

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {
  const fetcher = useFetcher(); 
  const favorite = fetcher.formData
    ? fetcher.formData.get("favorite") === "true"
    : contact.favorite;

  return (
    <fetcher.Form method="post">
      <button
        aria-label={
          favorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
};
