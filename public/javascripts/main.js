const sendFriendRequest = () => {
  const receiverId = req.body.receiverId;
  fetch(`/friend-request/${receiverId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      senderId: req.user._id,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to send friend request");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
};

// Get references to the necessary DOM elements
const likeButton = document.getElementById("likeButton");
const likeCountElement = document.getElementById("likeCount");

// Track the status ID
const statusId = "status_id_here"; // Replace with the actual status ID

// Event listener for the like button
likeButton.addEventListener("click", () => {
  // Send a PUT request to the API endpoint to increment the likes count
  fetch(`/status/${statusId}/like`, {
    method: "PUT",
  })
    .then((response) => response.json())
    .then((updatedStatus) => {
      // Update the like count in the UI
      likeCountElement.textContent = `Likes: ${updatedStatus.likes}`;
    })
    .catch((error) => {
      // Handle any errors
      console.error(error);
    });
});
