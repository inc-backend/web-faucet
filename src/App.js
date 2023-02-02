import React from "react";
import axios from "axios";
import { Button, Input, notification } from "antd";
import "./App.css";
import QrReader from "react-qr-reader";
// import { loadReCaptcha } from 'react-recaptcha-google'
import HCaptcha from '@hcaptcha/react-hcaptcha';

const api = process.env.REACT_APP_API_URL;
const siteKey = process.env.REACT_APP_SITE_KEY;

// const api = "https://api-coinservice.incognito.org/airdrop-service"

const isMainnet = process.env.REACT_APP_IS_MAINNET;
const renderAmount = (amount) => {
  return Number(amount) / 1e9;
};

// const SITE_KEY = 'a152f009-fa38-4cca-8971-228b31e42ffd';
const SITE_KEY = siteKey || 'd7d67196-a41f-4a41-b56c-febefb1c2211'; //New Key 
// const SITE_KEY = '10000000-ffff-ffff-ffff-000000000001'; //Test

const renderAddress = (address, left, right) => {
  const first = address.substring(0, left);
  const last = address.substring(address.length - right, address.length);
  return first + "..." + last;
};

const Messages = {
  "SOME_THING_ERROR": "Something went wrong, please reload page and try again",
  "FAUCET_PENDING": "This faucet is Pending. Waiting for transaction confirm!",
  "FAUCET_SUCESS": "This faucet is successfully. Waiting for transaction confirm!",
  "CAMERA_PERMISSION": "Please allow camera permission for browser and this site."
}

const ERRORS_MAP = {
  "checksum error" : "Invalid payment address (checksum error).",
  "Limit 2 times to get PRV V2": "You can only request maximum 2 times per address.",
  "Robot verification failed, please try again.": "Robot verification failed, please reload page and try again"
}
class App extends React.Component {
  constructor(props, context) {
    super(props, context);
  }
  state = {
    address: "",
    creatingTx: false,
    show: false,
    error: "",
    txID: "",
    isModalVisible: false,
    requests: [],
    verified: false,
    token: undefined,
  };
  verifyCallback = (token) => {
    if (!token) return;
    this.setState({
      verified: true,
      token,
    })
  }
  getRequest = async () => {
    const requests = await axios({
      method: "get",
      url: `${api}/faucet`,
    });
    this.setState({
      requests: requests.data.Data,
    });
  };

  getPaymentAddress = () => {
    const pathName = window.location?.pathname;
    if (!pathName) return;
    const array = pathName.split('=')
    if (array.length === 2 && array[0] === '/address' && array[1]) {
      const searchAddress = array[1]
      this.setState({
        address: searchAddress
      })
    }
  };

  async componentDidMount() {
    this.getPaymentAddress()
    if (isMainnet) return;
    // await this.getRequest();
  }

  showModel = (qrcode) => {
    const { isModalVisible } = this.state;
    this.setState({ isModalVisible: !isModalVisible, qrcode });
  };

  handleAPIError = (error) => {
    if (!error) return;

    if (typeof error === "string") return error

    const errorMessage = error.response?.data?.Error || Messages.SOME_THING_ERROR;
    if (errorMessage) {
      notification.error({
        message: "Error",
        description: errorMessage,
      });
    }
    return errorMessage
  }

  faucet = async () => {
    let that = this
    try {
      this.setState({
        creatingTx: true,
      });
      const { address, token } = this.state;
      const url = `${api}/faucet`

      const payload = {
        paymentaddress: address.trim(),
        captcha: token
      }
      let data;
      try {
          data = await new Promise(async (resolve, reject) => {
          try {
            const apiResponse = await axios({
              method: "post",
              headers: {
                'Content-Type': 'application/json',
              },
              url: url,
              data: payload,
            });

            const result = apiResponse?.data.Result
            let message = ""
            switch (result) {
              case -1:
                message = Messages.SOME_THING_ERROR
                notification.error({
                  message: "Error",
                  description: message});
                return reject({message})
              case 0: 

                message = Messages.SOME_THING_ERROR
                notification.error({
                  message: "Unknow",
                  description: message,
                });
                return reject({message})

              case 1: 
                message = Messages.FAUCET_PENDING
                notification.info({
                  message: "Pending",
                  description: message,
                });
                return resolve({message})

              case 2: 
                message = Messages.FAUCET_SUCESS
                notification.success({
                  message: "Successfully",
                  description: message,
                });
                return resolve({message})
              default:
                break;
            }
          } catch (error) {
            const errorMessage = that.handleAPIError(error)
            reject(errorMessage)
          }
        });
      } catch (error) {
        // this.handleAPIError(error)
      }
      this.setState({
        result: data && data.Result,
        txID: data && data.Result,
        creatingTx: false,
        error: "",
      });
    } catch (error) {
      this.setState({
        creatingTx: false,
        error:
            (error && error.errorMessage) ||
            (error && error.Msg) ||
            "Error, please try again!",
      });
    }
  };
  handleScan = (data) => {
    if (data) {
      this.showModel(false);
      this.setState({
        address: data,
      });
    }
  };
  handleError = (err) => {
    alert(Messages.CAMERA_PERMISSION);
    console.error(err);
  };
  renderRequestQueue = () => {
    if (isMainnet) return;
    const { requests } = this.state;
    return (
        <div className="table-container">
          <p className="request-queue">Request queue</p>
          <table className="table-requests">
            <thead>
            <tr
                style={{
                  color: "white",
                  height: "50px",
                  background: "#1E1E1E",
                  borderRadius: "5px",
                }}
            >
              <th>ID</th>
              <th>Address</th>
              <th className="desktop">Amount</th>
              <th>Transaction</th>
              <th>Status</th>
            </tr> 
            </thead>
            <tbody>
            {requests.map((item, index) => {
              return (
                  <tr
                      key={index}
                      style={index % 2 !== 0 ? { background: "#1E1E1E" } : {}}
                      className="table-content"
                  >
                    <td>{item.id}</td>
                    <td className="desktop">
                      {renderAddress(item.address, 18, 5)}
                    </td>
                    <td className="mobile">
                      {renderAddress(item.address, 5, 5)}
                    </td>
                    <td className="desktop">{renderAmount(item.amount)}</td>
                    <td>
                      <a
                          style={{ color: "#d8d8d8" }}
                          target="_blank"
                          rel="noopener noreferrer"
                          href={`https://mainnet.incognito.org/tx/${item.tx}`}
                      >
                        {renderAddress(item.tx, 5, 5)}
                      </a>
                    </td>
                    {item.status === 0 && (
                        <td style={{ color: "#FF9500" }}>Pending</td>
                    )}
                    {item.status === 1 && (
                        <td style={{ color: "#0091FF" }}>Processing</td>
                    )}
                    {item.status === 2 && <td>Success</td>}
                    {item.status === 3 && (
                        <td style={{ color: "#E02020" }}>Fail</td>
                    )}
                  </tr>
              );
            })}
            </tbody>
          </table>
        </div>
    )
  }
  renderSubTitle() {
    const message = isMainnet ? '' : 'Request a maximum of 0.1 PRV per address, per 24 hours.'
    return (
        <p className="airdrop-rule">{message}</p>
    )
  }
  render() {
    const {
      error,
      creatingTx,
      address,
      isModalVisible,
      qrcode,
      verified,
      txID
    } = this.state;
    return (
      <div className="root">
        {isModalVisible && (
          <div className="" id="modal">
            <div className="root-container header-container">
              <img className="logo" src={"./logo.svg"} alt="logo" />
              <img
                onClick={() => this.showModel(false)}
                className="close"
                src={"./close.svg"}
                alt="close"
              />
            </div>
            {qrcode ? (
              <div className='root-camera'>
              <div className="camera">
                <QrReader
                  delay={300}
                  onError={this.handleError}
                  onScan={this.handleScan}
                  style={{ width: "100%" }}
                />
              </div>
              </div>
            ) : (
              <div className="mobile-menu">
                <a
                  className="btn-header"
                  href="https://docs.incognito.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Docs
                </a>
                <a
                  className="btn-header"
                  href="https://we.incognito.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Community
                </a>
              </div>
            )}
          </div>
        )}
        <div className="root-container">
          <div className="header-container">
            <img className="logo" src={"./logo.svg"} alt="logo" />
            <div>
              <div className="mobile-text">
                <img
                  onClick={() => this.showModel(false)}
                  className="menu"
                  src={"./menu.svg"}
                  alt="menu"
                />
              </div>
              <div className="desktop-text">

                <a
                  className="btn-header"
                  href="https://docs.incognito.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Docs
                </a>
                <a
                  className="btn-header"
                  href="https://we.incognito.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Community
                </a>
              </div>
            </div>
          </div>
          <div className="body-container">
            <div className="airdrop-container">
              <p className="airdrop-label">
                PRV is the native coin of Incognito.
              </p>
              <p className="airdrop-label desktop-text">
                You can use it to build privacy for the world.{" "}
              </p>

              <p className="airdrop-label mobile-text">
                You can use it to build privacy{" "}
              </p>
              <p className="airdrop-label mobile-text">for the world. </p>
              {/* {this.renderSubTitle()} */}
              <Input
                value={address}
                className="input-address"
                onChange={(e) => this.setState({ address: e.target.value })}
                name="address"
                placeholder="Enter Incognito address"
                type="text"
              />
              <img
                onClick={() => this.showModel(true)}
                className="qrcode"
                src={"./qrcode.svg"}
                alt="logo"
              />
              {error && error !== "" && <p className="error-message">{error}</p>}
              {txID && txID !== "" && <p className="success-message">{`txHash: ${txID}`}</p>}
              <Button
                size="large"
                className="btn-faucet"
                disabled={creatingTx || !verified || !address}
                onClick={async () => await this.faucet()}
              >
                {creatingTx ? 'Requesting...' : 'Give me PRV'}
              </Button>
              <div className='wrapCaptcha'>
                <HCaptcha
                    sitekey={SITE_KEY}
                    onVerify={this.verifyCallback}
                />
              </div>
            </div>
          </div>
        </div>
        {/* {this.renderRequestQueue()} */}
      </div>
    );
  }
}

export default App;
