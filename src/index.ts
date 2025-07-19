import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/" , (req,res)=>{
    res.send("BiteSpeed Identity Reconciliation API");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});

app.post("/identify" , async (req,res) =>{
    const {email} = req.body;
    const {phoneNumber} = req.body;
    if(!email && !phoneNumber){
        return res.status(400).json({error : "Atleast one of Email or PhoneNumber is required"});
    }

    const contacts = await prisma.contact.findMany({
        where:{
            OR:[
                email ? {email} : undefined,
                phoneNumber ? {phoneNumber} : undefined,
            ].filter(Boolean) as any,
        },
        orderBy:{ createdAt : "asc"},
    });

    let primaryContact: any = null;
    let allContacts: any[] = [];
    let secondaryContactIds: number[] = [];

    if(contacts.length === 0){
        primaryContact = await prisma.contact.create({
            data:{
                email,
                phoneNumber,
                linkPrecedence : "primary",
            },
        });
        allContacts = [primaryContact];
    }
    else{
        primaryContact = contacts.find(c => c.linkPrecedence === "primary") || contacts[0];
        allContacts = await prisma.contact.findMany({
            where: {
                OR: [
                    {id: primaryContact.id},
                    {linkedId: primaryContact.id},
                ],
            },
            orderBy: {createdAt: "asc"},
        });
    
    const emailExists = allContacts.some(c => c.email === email);
    const phoneNumberExists = allContacts.some(c => c.phoneNumber === phoneNumber);

    if((!emailExists && email) || (!phoneNumberExists && phoneNumber)){
        const secondaryContact = await prisma.contact.create({
            data: {
                email,
                phoneNumber,
                linkPrecedence: "secondary",
                linkedId: primaryContact.id,
            },
        });
        allContacts.push(secondaryContact);
    }

    const allPrimary = contacts.filter(c => c.linkPrecedence === "primary");
    if(allPrimary.length > 1){
        const oldest = allPrimary[0];
        for(const p of allPrimary.slice(1)){
            await prisma.contact.update({
                where: {id: p.id},
                data: {
                    linkPrecedence: "secondary",
                    linkedId: oldest.id,
                }
            });
        }
        primaryContact = oldest;

        allContacts = await prisma.contact.findMany({
            where: {
                OR:[
                    {id: oldest.id},
                    {linkedId: oldest.id},
                ],
            },
            orderBy: {createdAt: "asc"},
        });
    }
}

const emails = Array.from(new Set(allContacts.map(c => c.email).filter(Boolean)));
const phoneNumbers = Array.from(new Set(allContacts.map(c => c.phoneNumber).filter(Boolean)));
secondaryContactIds = allContacts.filter(c => c.linkPrecedence === "secondary").map(c => c.id);

res.json({
    contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
    },
  });

});




