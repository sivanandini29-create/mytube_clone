import axios from "axios";
import Script from "next/script";
import { useUser } from "../lib/AuthContext";

const Subscription = () => {
  const { user } = useUser();
  const handlePayment = async (amount, plan) => {
    if(!user?._id){
      alert("please login first");
      return;
    }
    try {
      const { data } = await axios.post(
        "http://localhost:5000/payment/create-order",
        { amount },
      );

      console.log("Order Created:", data);

      const options = {
        key: "rzp_test_TMvt6ViTl8ehVt",
        amount: data.amount,
        currency: data.currency,
        name: "YourTube",
        description: `${plan} Subscription`,
        order_id: data.id,

        handler: async function (response) {
          try {
            console.log("razorpay response,", response);
            const result = await axios.post(
              "http://localhost:5000/payment/verify",
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan: plan,
                userId:user._id,
              },
            );

            console.log("payment Verified:", result.data);

            alert("payment successfull");
          } catch (error) {
            console.log("Verification Error:", error);
            alert("payment verification failed");
          }
        },

        theme: {
          color: "#f97316",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      console.log("Selected Plan:", plan);
    } catch (error) {
      console.log("Payment Error:", error);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <div className="py-10">
        <h1 className="text-3xl font-bold text-center">Choose Your Plan</h1>

        <p className="text-center text-gray-500 mt-2">
          Upgrade your plan to unlock premium features.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 px-10">
          {/* Free */}
          <div className="border rounded-lg p-6 shadow-md text-center">
            <h2 className="text-2xl font-bold">Free</h2>

            <p className="mt-2">₹0 / Month</p>

            <ul className="mt-4 space-y-2">
              <li>Limited Premium Videos</li>
              <li>Basic Features</li>
              <li>No Downloads</li>
              <li>Ads Enabled</li>
            </ul>

            <button className="mt-6 bg-gray-500 text-white px-4 py-2 rounded">
              Current Plan
            </button>
          </div>

          {/* Bronze */}
          <div className="border rounded-lg p-6 shadow-md text-center">
            <h2 className="text-2xl font-bold text-yellow-600">Bronze</h2>

            <p className="mt-2">₹99 / Month</p>

            <ul className="mt-4 space-y-2">
              <li>Premium Videos</li>
              <li>Longer Watch Time</li>
              <li>Downloads</li>
              <li>Ad-Free</li>
            </ul>

            <button
              onClick={() => handlePayment(99, "Bronze")}
              className="mt-6 bg-yellow-600 text-white px-4 py-2 rounded"
            >
              Upgrade
            </button>
          </div>

          {/* Silver */}
          <div className="border rounded-lg p-6 shadow-md text-center">
            <h2 className="text-2xl font-bold text-gray-500">Silver</h2>

            <p className="mt-2">₹199 / Month</p>

            <ul className="mt-4 space-y-2">
              <li>Premium Videos</li>
              <li>Longer Watch Time</li>
              <li>Downloads</li>
              <li>Ad-Free</li>
            </ul>

            <button
              onClick={() => handlePayment(199, "Silver")}
              className="mt-6 bg-gray-500 text-white px-4 py-2 rounded"
            >
              Upgrade
            </button>
          </div>

          {/* Gold */}
          <div className="border rounded-lg p-6 shadow-md text-center">
            <h2 className="text-2xl font-bold text-orange-500">Gold</h2>

            <p className="mt-2">₹299 / Month</p>

            <ul className="mt-4 space-y-2">
              <li>Premium Videos</li>
              <li>Unlimited Watch Time</li>
              <li>Video Downloads</li>
              <li>Ad-Free Experience</li>
            </ul>

            <button
              onClick={() => handlePayment(299, "Gold")}
              className="mt-6 bg-orange-500 text-white px-4 py-2 rounded"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Subscription;
