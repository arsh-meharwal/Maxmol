import { Alert } from "react-native";
import {
  Client,
  Account,
  ID,
  Avatars,
  Databases,
  Query,
  Storage,
  Permission,
  Role,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.company.ecommerce",
  projectId: "asad",
  databaseId: "",
  userCollectionId: "",
  wishlistCollectionId: "",
  productsCollectionId: "",
  addressCollectionId: "",
  tokenCollectionId: "",
  orderCollectionId: "",
  categoriesCollectionId: "",
  miscellaneousCollectionId: "",
  storageId: "",
};

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
  .setProject(appwriteConfig.projectId) // Your project ID
  .setPlatform(appwriteConfig.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatar = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

const parseArray = (arr) => {
  let parsed = [];
  for (let i = 0; i < arr.length; i++) {
    let string = JSON.parse(arr[i]);
    parsed.push(string);
  }
  return parsed;
};

const stringifyArray = (arr) => {
  let stringifiedArray = [];
  for (let i = 0; i < arr.length; i++) {
    let string = JSON.stringify(arr[i]);
    stringifiedArray.push(string);
  }
  return stringifiedArray;
};

export const getCurrentUser = async () => {
  try {
    // Logged in account is being fetched here
    const currentAccount = await account.get();
    if (!currentAccount) return false;
    else return currentAccount;
  } catch (error) {
    console.log("Error here", error);
  }
};

let user;

// getUserData & checkUserInDatabase are both same
export const getUserData = async (num) => {
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    [Query.equal("number", num)]
  );
  return res;
};

export const checkUserInDatabase = async (num) => {
  try {
    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("number", num)]
    );
    return currentUser;
  } catch (error) {
    console.log("Error here", error);
  }
};

export const addUser = async (data) => {
  try {
    const currentUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        name: data.name,
        number: data.number,
      }
    );
    return currentUser;
  } catch (error) {
    console.log("Error here", error);
  }
};

export const checkWishList = async (num) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.wishlistCollectionId,
      [Query.equal("user", num)]
    );

    const items = response.documents[0].items;
    const cartId = response.documents[0].$id;
    return { id: cartId, list: items };
  } catch (error) {
    return false;
  }
};

export const modifySearchHistory = async (userId, historyArray) => {
  const stringifiedItems = stringifyArray(historyArray);

  // Update the cart document with the merged items
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userId,
    { search: stringifiedItems }
  );

  return true;
};

export const modifyCart = async (userId, cartItems) => {
  const stringifiedItems = stringifyArray(cartItems);
  console.log(stringifiedItems);

  // Update the cart document with the merged items
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userId,
    { cart: stringifiedItems }
  );

  return true;
};

export const modifyProductReviewed = async (userId, newArray) => {
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userId,
    { productsReviewed: newArray }
  );
  return true;
};

export const modifyProductBought = async (userId, newArray) => {
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userId,
    { productsBought: newArray }
  );
  return true;
};

export const modifyWishList = async (userId, newArray) => {
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userId,
    { wishlist: newArray }
  );
  return true;
};

export const addToWishList = async (number, productId) => {
  try {
    const doc = await checkWishList(number);
    const items = doc.list;
    console.log(items, "checkWishList");
    const updatedList = [...items, productId];
    console.log(updatedList, "updatedCart");
    const updatedData = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.wishlistCollectionId,
      doc.id,
      { items: updatedList }
    );

    return { status: true };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const mobileOTP = async (number) => {
  const token = await account.createPhoneToken(ID.unique(), number);
  console.log("token", token);

  if (token.userId) {
    user = token.userId;
    return true;
  } else return false;
};

export const verifyOTP = async (otpInString) => {
  try {
    console.log(otpInString);
    const session = await account.createSession(user, otpInString);
    return { success: true, session: session };
  } catch (error) {
    console.log(error);
    if (error.code === 401) {
      // Assuming 401 Unauthorized for wrong OTP
      return { success: false, message: "Invalid OTP. Please try again." };
    } else return error;
  }
};

export const createToken = async (user) => {
  try {
    const date = new Date();
    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tokenCollectionId,
      ID.unique(),
      {
        userId: user,
        time: date.toISOString(),
      }
    );
    return response;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const searchAllUsers = async (searchTerm) => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.search("name", searchTerm)]
    );

    return { status: true, data: res.documents };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const searchAllProducts = async (searchTerm) => {
  try {
    const searchQueries = searchTerm ? [Query.search("title", searchTerm)] : [];

    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      searchQueries
    );

    return { status: true, data: res.documents };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getAllProductWithoutCategory = async () => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId
    );
    const productsWithoutCategory = res.documents.filter(
      (product) => !product.category
    );

    return {
      status: true,
      data: productsWithoutCategory,
      totalPages: res.total,
    };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getAllVisibleProductOfSingleCategory = async (
  limit,
  offset,
  category
) => {
  try {
    const startTime = Date.now();
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      [
        Query.equal("visible", true),
        Query.equal("category", category),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );
    const endTime = Date.now();
    const duration = endTime - startTime;
    return { status: true, data: res.documents, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getAllProductOfSingleCategory = async (
  limit,
  offset,
  category
) => {
  try {
    const startTime = Date.now();
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      [
        Query.equal("category", category),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );
    const endTime = Date.now();
    const duration = endTime - startTime;
    return { status: true, data: res.documents, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getAllVisibleProducts = async (limit, offset) => {
  try {
    const startTime = Date.now();
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      [Query.equal("visible", true), Query.limit(limit), Query.offset(offset)]
    );
    const endTime = Date.now();
    const duration = endTime - startTime;
    return { status: true, data: res.documents, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getAllProducts = async (limit, offset) => {
  try {
    const startTime = Date.now();
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      [Query.limit(limit), Query.offset(offset)]
    );
    const endTime = Date.now();
    const duration = endTime - startTime;
    return { status: true, data: res.documents, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getAllCategories = async () => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId
    );
    return { status: true, data: res.documents };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getAllOrdersByUser = async (user, date) => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orderCollectionId,
      [Query.equal("userId", user), Query.greaterThan("createdDate", date)]
    );
    let orders = res.documents;
    for (const data of orders) {
      const parsedProducts = parseArray(data.products);
      const parsedAddress = JSON.parse(data.address[0]);
      data.products = parsedProducts;
      data.address = parsedAddress;
    }
    return { status: true, orders: orders, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

// export const getAllOrders = async () => {
//   try {
//     const res = await databases.listDocuments(
//       appwriteConfig.databaseId,
//       appwriteConfig.orderCollectionId
//     );
//     return { status: true, orders: res.documents };
//   } catch (error) {
//     return { status: false, error: error };
//   }
// };

export const getAllNewOrders = async () => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orderCollectionId,
      [Query.equal("status", "New Order")]
    );
    let orders = res.documents;
    for (const data of orders) {
      const parsedProducts = parseArray(data.products);
      data.products = parsedProducts;
    }
    return { status: true, orders: orders, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getAllCancellRequestOrders = async () => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orderCollectionId,
      [Query.equal("cancelStatus", "Cancel Request")]
    );
    let orders = res.documents;
    for (const data of orders) {
      const parsedProducts = parseArray(data.products);
      data.products = parsedProducts;
    }
    return { status: true, orders: orders, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getAllAcceptedOrders = async () => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orderCollectionId,
      [Query.equal("status", "Accepted")]
    );
    let orders = res.documents;
    for (const data of orders) {
      const parsedProducts = parseArray(data.products);
      data.products = parsedProducts;
    }
    return { status: true, orders: orders, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getAllShippedOrders = async () => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orderCollectionId,
      [Query.equal("status", "Shipped")]
    );
    let orders = res.documents;
    for (const data of orders) {
      const parsedProducts = parseArray(data.products);
      data.products = parsedProducts;
    }
    return { status: true, orders: orders, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getAllCancelledOrders = async (limit, offset) => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orderCollectionId,
      [
        Query.limit(limit),
        Query.offset(offset),
        Query.equal("status", "Cancelled"),
      ]
    );
    let orders = res.documents;
    for (const data of orders) {
      const parsedProducts = parseArray(data.products);
      data.products = parsedProducts;
    }
    return { status: true, orders: orders, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getAllDeliveredOrders = async (limit, offset) => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orderCollectionId,
      [
        Query.limit(limit),
        Query.offset(offset),
        Query.equal("status", "Delivered"),
      ]
    );
    let orders = res.documents;
    for (const data of orders) {
      const parsedProducts = parseArray(data.products);
      data.products = parsedProducts;
    }
    return { status: true, orders: orders, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const updateProductVisibility = async (productId, visibility) => {
  if (visibility) {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      productId,
      {
        visible: visibility,
      }
    );
  } else {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      productId,
      {
        visible: visibility,
      }
    );
    await deleteProductFromCartandWishlist(productId);
  }
};

export const removeCategory = async (categoryId) => {
  await databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.categoriesCollectionId,
    categoryId
  );

  //Finding and removing the product of the category
  const documents = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    [Query.equal("category", categoryId)]
  );

  console.log(documents, "Product of the deleted category");

  // Loop through the documents and delete each one's Category Id
  for (const document of documents.documents) {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      document.$id,
      { category: null }
    );
  }
};

export const deleteProductFromCartandWishlist = async (productId) => {
  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId // Assuming you have a users collection
    );
    // Iterate through ALL users to update their cart and wishlist and search history
    for (const user of users.documents) {
      const updatedCart = user.cart.filter(
        (item) => JSON.parse(item).productId !== productId
      );
      const updatedSearch = user.search.filter(
        (item) => JSON.parse(item).productId !== productId
      );
      const updatedWishlist = user.wishlist.filter((id) => id !== productId);

      console.log(updatedCart, updatedSearch, "updatedCart", "updatedSearch");

      // Update ALL user's cart and wishlist
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        user.$id,
        {
          cart: updatedCart,
          wishlist: updatedWishlist,
          search: updatedSearch,
        }
      );
    }
  } catch (error) {
    alert(error);
  }
};

export const removeProduct = async (productId) => {
  //deleting images from storage
  let product = await databases.getDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    productId
  );
  const imageIds = product.images;
  if (Array.isArray(imageIds)) {
    for (const imageId of imageIds) {
      await storage.deleteFile(appwriteConfig.storageId, imageId); // Delete each image
      console.log(`Image with ID ${imageId} deleted successfully.`);
    }
  } else {
    console.log("No images found for this product.");
  }
  await databases.deleteDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    productId
  );
  await deleteProductFromCartandWishlist(productId);
};

export const updateProductStock = async (productId, newQty) => {
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    productId,
    {
      stock: parseInt(newQty, 10),
    }
  );
};

export const getLowStockProducts = async () => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      [Query.between("stock", 1, 5)]
    );

    return { status: true, data: res.documents, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getOutStockProducts = async () => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      [Query.lessThanEqual("stock", 0)]
    );

    return { status: true, data: res.documents, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getSimilarProducts = async (name, category) => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      [
        Query.equal("category", category), // Fetch products from the same category
        Query.notEqual("title", name), // Exclude the product with the exact same name
        //Query.contains("title", name.slice(0, 8)), // Fetch products with titles similar to the name
      ]
    );
    return { status: true, data: res.documents };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getSingleProduct = async (id) => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      [Query.equal("$id", id)]
    );

    if (res.documents.length === 0 || !res.documents[0].visible) {
      // Either the product was not found or it is not visible
      return {
        status: false,
        error: `Product with id ${id} not found or is not visible.`,
      };
    }

    return { status: true, data: res.documents[0] };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const addAddress = async (userId, addressArray) => {
  try {
    let strResult = stringifyArray(addressArray);
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        address: strResult,
      }
    );
    return true;
  } catch (error) {
    return error;
  }
};

export const addOrder = async (
  data,
  userId,
  paymentStatus,
  paymentId,
  price,
  estDate,
  extraCharge
) => {
  try {
    let stringifiedProduct = data.products.map((item) => JSON.stringify(item));
    let stringifiedAddres = JSON.stringify(data.deliverTo);

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orderCollectionId,
      [],
      1
    ); // Limit to 1 document for minimal data
    const documentCount = parseInt(response.total, 10) + 1; // Calculating total Orders in DB

    const res = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.orderCollectionId,
      ID.unique(),
      {
        userId: userId,
        number: documentCount.toString(),
        createdDate: data.date,
        address: [stringifiedAddres],
        payment: paymentStatus,
        price: price,
        products: stringifiedProduct,
        user: data.user,
        status: "New Order",
        razorpayId: paymentId,
        estimatedDelivery: estDate,
        extraShippingCharge: extraCharge,
      }
    );
    console.log(res, "orderRes");
  } catch (error) {
    console.log(error);
  }
};

export const modifyOrderStatus = async (
  orderId,
  status,
  date,
  cancelReason,
  accDetail
) => {
  try {
    // Update the cart document with the merged items
    if (status === "Accepted") {
      const updatedData = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.orderCollectionId,
        orderId,
        {
          status: status,
          acceptedDate: date,
        }
      );
      console.log(updatedData, "updatedData");
      return { status: true, data: updatedData };
    } else if (status === "Shipped") {
      const updatedData = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.orderCollectionId,
        orderId,
        {
          status: status,
          shippedDate: date,
        }
      );
      console.log(updatedData, "updatedData");
      return { status: true, data: updatedData };
    } else if (status === "Delivered") {
      const updatedData = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.orderCollectionId,
        orderId,
        {
          status: status,
          deliveredDate: date,
        }
      );
      console.log(updatedData, "updatedData");
      return { status: true, data: updatedData };
    } else if (status === "Cancel Request") {
      const updatedData = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.orderCollectionId,
        orderId,
        {
          cancelStatus: status,
          cancelDate: date,
          cancelReason: cancelReason,
          refundAccDetails: accDetail,
        }
      );
      return { status: true, data: updatedData };
    } else if (status === "Refund Completed") {
      const updatedData = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.orderCollectionId,
        orderId,
        {
          status: "Cancelled",
          cancelStatus: status,
          refundDate: date,
        }
      );
      return { status: true, data: updatedData };
    }
  } catch (error) {
    console.log(error);
    return { status: false, error: error };
  }
};

export const getAllUsers = async () => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId
    );
    return { status: true, data: res.documents, totalPages: res.total };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const getMiscellaneousData = async () => {
  try {
    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.miscellaneousCollectionId
    );

    return { status: true, data: res.documents[0] };
  } catch (error) {
    return { status: false, error: error };
  }
};

export const modifyCategoryDiscount = async (catId, catData) => {
  const res = await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.categoriesCollectionId,
    catId,
    { discount: catData }
  );

  return { status: true };
};

export const modifyCategoryGst = async (catId, catData) => {
  const res = await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.categoriesCollectionId,
    catId,
    { gst: catData }
  );

  return { status: true };
};

export const addSale = async (data) => {
  const response = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId
  );

  const { documents } = response;

  // Loop through all documents and update each one
  for (let i = 0; i < documents.length; i++) {
    const documentId = documents[i].$id;

    // Update each document's discount field
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.productsCollectionId,
      documentId,
      { discount: data }
    );
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.miscellaneousCollectionId,
      "66f2b7d20014f1bf6103",
      { sale: data }
    );
  }

  return true;
};

export const modifyMiscellaneousDelivery = async (data) => {
  // If there is a document, update the first document
  let stringified = stringifyArray(data);
  const res = await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.miscellaneousCollectionId,
    "66f2b7d20014f1bf6103",
    { states: stringified } // Updating the specific attribute
  );
  return { status: true, data: res };
};

export const modifyProductComments = async (productId, commentArray) => {
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    productId,
    {
      comments: commentArray,
    }
  );
  return true;
};

export const setProductReview = async (
  productId,
  userId,
  avgStar,
  totalRatings,
  commentArray,
  productsReviewdArray
) => {
  const res = await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    productId,
    {
      stars: avgStar,
      comments: commentArray,
      totalRatings: totalRatings,
    }
  );
  console.log(productsReviewdArray);

  // setting products Reviewed array for user
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    userId,
    { productsReviewed: productsReviewdArray }
  );

  console.log(res);

  return true;
};

export const checkCancelValidity = async (orderId) => {
  // First, check if any document exists in the Miscellaneous collection
  const res = await databases.getDocument(
    appwriteConfig.databaseId,
    appwriteConfig.orderCollectionId,
    orderId
  );

  if (res.status === "New Order" && !res.cancelStatus) {
    return true;
  }
};

export const getProductReview = async (productId) => {
  // First, check if any document exists in the Miscellaneous collection
  const res = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.reviewsCollectionId,
    [Query.equal("product", productId)]
  );

  return res;
};
