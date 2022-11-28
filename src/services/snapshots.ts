import axios from "axios";
import mapper from './mapper/snapshots'
import {config} from "../util/axios";

const ok = "ok";
const dropletActionUrl = (id: string) => `https://api.digitalocean.com/v2/droplets/${id}/actions`;
const actionUrl = (id: string) => `https://api.digitalocean.com/v2/actions/${id}`;
const snapshotUrl = (id: string) => `https://api.digitalocean.com/v2/snapshots/${id}`;


const getSnapshotId = async () => {
    const url = "https://api.digitalocean.com/v2/snapshots";
    const result = await axios.get(url, config({ tag_name: "dnd", resource_type: "droplet" }));

    return mapper.fromIdResponse(result.data);
}

const deleteSnapshot = async (id: string) => {
    await axios.delete(snapshotUrl(id), config());

    return ok;
}


const takeSnapshot = async (dropletId: string) => {
    const snapshotResult = await axios.post(dropletActionUrl(dropletId), { type: "snapshot" }, config());
    const actionId = snapshotResult.data.action.id;

    let status = await axios.get(actionUrl(actionId), config());
    while (status.data.status != "completed") {
        console.log("Waiting for snapshot to complete, action status currently: " + status.data.status)
        await new Promise((resolve) => setTimeout(resolve, 2500));
        status = await axios.get(actionUrl(actionId), config());
    }

    return ok;
}


export default {
    takeSnapshot,
    getSnapshotId,
    deleteSnapshot
}