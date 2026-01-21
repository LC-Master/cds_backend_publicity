import { ISnapshotDto } from "../../types/dto.type";
import { IFile } from "../../types/file.type";
/**
 * @author Francisco A. Rojas F.
 * @description Extrae y aplana la lista de medios únicos de todas las campañas del DTO.
 * @param {ISnapshotDto} dto - DTO proveniente del CMS.
 * @returns {IFile[]} Lista de objetos simplificados para descarga y validación.
 */
export function extractMediaList(dto: ISnapshotDto): IFile[] {
  if (!dto?.data?.campaigns) return [];

  return dto.data.campaigns.flatMap((campaign) => {
    const am = campaign.slots.am;
    const pm = campaign.slots.pm;

    return [...am, ...pm].map((slot) => ({
      id: slot.id,
      name: slot.name,
      checksum: slot.checksum,
    }));
  });
}
