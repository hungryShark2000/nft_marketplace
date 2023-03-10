import { useState } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
const client = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    apiPath: '/api/v0/',
    headers: {
        authorization: "auth:auth"
    }
})

const Create = ({marketplace, nft}) => { //remove async to fix
    const [image, setImage] = useState('')
    const [price, setPrice] = useState(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')


    const uploadToIPFS = async (event) => {

        event.preventDefault()
        const file = event.target.files[0]
        if (typeof file !== 'undefined') {
            try {
                const result = await client.add(file)
                console.log(result)
                setImage(`https://ipfs.infura.io/ipfs/${result.path}`)
            } catch (error) {
                console.log("ipfs image upload error: ", error)
            }
        }
    }
    const createNFT = async () => {
        console.log("Minteddddd")
        if (!image || !price || !name || !description) return
        try {
            console.log("Minteddddd1")
            const result = await client.add(JSON.stringify({image, price, name, description}))
            mintThenList(result)
            console.log("Minteddddd2")
        } catch (error) {
            console.log("ipfs uri upload error: ", error)
        }
    }
    const mintThenList = async (result) => {
        console.log("Minteddddd2")
        const uri = `https://ipfs.infura.io/ipfs/${result.path}`
        // mint nft
        await (await nft.mint(uri)).wait()
        // get tokenId of new nft
        const id = await nft.tokenCount()
        // approve marketplace to spend nft
        await (await nft.setApprovalForAll(marketplace.address, true)).wait()
        // add nft to marketplace
        const listingPrice = ethers.utils.parseEther(price.toString())
        await (await marketplace.makeItem(nft.address, id, listingPrice)).wait()
    }
    return (
        <div style={{
            display: "inline-block",
            borderRadius: "10px",
            overflow: "hidden",
            backgroundColor: "#282828",
            color: "#FFFFFF",
            fontFamily: "Helvetica",
            fontSize: "16px",
            padding: "200px"
        }}
             className="container-fluid mt-5">
            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{maxWidth: '1000px'}}>
                    <div className="content mx-auto">
                        <Row className="g-4">
                            <Form.Control
                                type="file"
                                required
                                name="file"
                                onChange={uploadToIPFS}
                                style={{borderRadius: "20px", border: "2px solid #1DB954",}}
                            />
                            <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text"
                                          placeholder="Name"
                                          style={{
                                              borderRadius: "20px",
                                              border: "2px solid #1DB954"
                                          }}/>
                            <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required
                                          as="textarea" placeholder="Description"
                                          style={{
                                              borderRadius: "20px",
                                              border: "2px solid #1DB954"
                                          }}/>
                            <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number"
                                          placeholder="Price in ETH"
                                          style={{
                                              borderRadius: "20px",
                                              border: "2px solid #1DB954"
                                          }}/>
                            <div
                                style={{
                                    display: "inline-block",
                                    borderRadius: "10px",
                                    overflow: "hidden"
                                }} className="d-grid px-0">
                                <Button
                                    className="btn btn-primary btn-lg rounded-pill px-5"
                                    style={{
                                        background: "#1DB954",
                                        border: "none",
                                        borderRadius: "10px",
                                        color: "white",
                                        fontFamily: "Helvetica",
                                        fontSize: "18px",
                                        fontWeight: "bold",
                                        padding: "12px 36px",
                                        textAlign: "center",
                                        textDecoration: "none",
                                        display: "inline-block",
                                        margin: "4px 2px",
                                        cursor: "pointer"
                                    }} onClick={createNFT} variant="primary" size="lg">
                                    Create & List NFT!
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Create