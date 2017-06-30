import moment from 'moment';
import Neo from '../model/Neo';

export const saveNeo = (neo, date, callback) => {
  let speed = null;

  if (neo.close_approach_data && neo.close_approach_data[0]) {
    speed = neo.close_approach_data[0].relative_velocity.kilometers_per_hour;
  }

  const neoDoc = new Neo({
    name: neo.name,
    reference: neo.neo_reference_id,
    speed,
    isHazardous: neo.is_potentially_hazardous_asteroid,
    date: moment(date).toDate()
  });

  neoDoc.save(callback);
};