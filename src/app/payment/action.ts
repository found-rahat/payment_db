"use server";
import { prisma } from "@/lib/prisma";

import { randomUUID } from "crypto";
export async function getCustomerByOrderId(orderId: number) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
      include: { customer: true }, // ধরে নিচ্ছি order এর মধ্যে customer relation আছে
    });
    console.log("order", order);

    if (!order || !order.customer) {
      throw new Error("Customer not found for this order");
    }

    return order.customer;
  } catch (error) {
    console.error("Error fetching customer by order ID:", error);
    return null;
  }
}

export async function createPayPosPayment(
  id: number,
  amount: number,
  host: string,
  protocol: string
) {
  const customerInformation = await prisma.customer.findFirstOrThrow({
    where: {
      id,
    },
  });
  console.log("customerInformation", customerInformation);
  const transectionId = randomUUID();
  const marchentId = "104-1653730183";
  const password = "gamecoderstorepass";
  console.log("invoice_number", transectionId);

  let initiatePayment = await fetch(
    `${process.env.SANDBOX_URL}/initiate-payment`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        merchantId: marchentId,
        password: password,

        invoice_number: transectionId,
        payment_amount: amount,
        currency: "BDT",
        cust_name: customerInformation.name,
        cust_phone: customerInformation.phone,
        cust_email: customerInformation.email || "",
        cust_address: customerInformation.address,
        callback_url: `${protocol}//${host}/model_test?customer_id=${customerInformation.id}`,
        pay_with_charge: 1,
      }),
    }
  );

  const responseData = await initiatePayment.json();
  const { status, status_code, invoice_number, payment_url, payment_amount } =
    responseData;
  if (status !== "success" || status_code !== "200" || !payment_url) {
    throw new Error(`initiate payment failed: ${JSON.stringify(responseData)}`);
  }

  const sessionStore = await prisma.session_store.create({
    data: {
      paymentID: transectionId,
      customer_id: id,
      created_at: new Date(),
      data: {
        vendor: "paystation",
        amount: amount,
        invoice_number: transectionId,
        payment_amount: payment_amount,
        payment_url: payment_url,
      },
    },
  });
  if (!sessionStore) throw new Error("session store creation failed");

  return payment_url;
}
