const sendFriendRequest = () => {
  const receiverId = req.body.receiverId; // Replace with the ID of the user you want to send a friend request to
  fetch(`/friend-request/${receiverId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      senderId: req.user._id, // Replace with the ID of the sender (you)
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to send friend request");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data); // Handle the response data here
    })
    .catch((error) => {
      console.error(error); // Handle the error here
    });
};
